from fastapi import UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
import io
import PyPDF2
import base64
from lib.Database_config import get_db, DB_ENABLED
from lib.Groq_config import get_groq_client
from lib.Groq_models_config import ModelConfig
import re

from typing import Optional

# Conditional imports
if DB_ENABLED:
    from models.database_models import MessageRole, FileType
    from utils.database_utils import ConversationDB, MessageDB, FileDB, ContextDB
else:
    # Fallback to in-memory storage
    from utils.rag_store import VECTOR_STORE


class ChatBot:
    """
    Unified ChatBot Controller with Database Integration

    Features:
    - PostgreSQL database for persistent storage
    - Multi-model AI system (Vision, Document, Chat)
    - Conversation history tracking
    - File storage and retrieval
    """

    @staticmethod
    def get_file_type(filename: str) -> FileType:
        """Determine file type from filename"""
        filename_lower = filename.lower()

        if filename_lower.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp")):
            return FileType.IMAGE
        elif filename_lower.endswith(".pdf"):
            return FileType.PDF
        elif filename_lower.endswith((".doc", ".docx")):
            return FileType.WORD
        elif filename_lower.endswith(
            (
                ".txt",
                ".md",
                ".csv",
                ".json",
                ".xml",
                ".html",
                ".css",
                ".js",
                ".py",
                ".java",
                ".cpp",
                ".c",
                ".h",
            )
        ):
            return FileType.TEXT
        else:
            return FileType.UNKNOWN

    @staticmethod
    async def extract_text_from_pdf(content: bytes) -> str:
        """Extract text from PDF"""
        pdf_file = io.BytesIO(content)
        reader = PyPDF2.PdfReader(pdf_file)

        if len(reader.pages) == 0:
            raise ValueError("PDF has no pages")

        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        if not text.strip():
            raise ValueError("No text could be extracted from PDF")

        return text

    @staticmethod
    async def extract_text_from_word(content: bytes) -> str:
        """Extract text from Word document"""
        try:
            import docx

            doc_file = io.BytesIO(content)
            doc = docx.Document(doc_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

            if not text.strip():
                raise ValueError("No text found in Word document")

            return text
        except ImportError:
            raise ValueError("python-docx not installed. Run: pip install python-docx")

    @staticmethod
    async def call_ai_with_fallback(
        client, task_type: str, messages: list
    ) -> tuple[str, str]:
        """Call AI with automatic fallback"""
        config = ModelConfig.get_model_for_task(task_type)

        try:
            print(f"🤖 Using {config['model']} for {task_type}")
            response = client.chat.completions.create(
                model=config["model"], messages=messages, **config["settings"]
            )
            return response.choices[0].message.content, config["model"]

        except Exception as e:
            print(f"⚠️ Primary model failed: {e}")
            print(f"🔄 Trying fallback: {config['fallback']}")

            try:
                response = client.chat.completions.create(
                    model=config["fallback"], messages=messages, **config["settings"]
                )
                return response.choices[0].message.content, config["fallback"]

            except Exception as fallback_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"AI failed. Primary: {str(e)}, Fallback: {str(fallback_error)}",
                )

    @staticmethod
    async def handle_request(
        file: UploadFile | None = None,
        message: str | None = None,
        action: str | None = None,
        session_id: str | None = None,
        db: Session = Depends(get_db),
    ):
        """
        🎯 UNIFIED HANDLER with Database Persistence

        Args:
            file: Optional file upload
            message: Optional message/question
            action: Optional action command
            session_id: Optional conversation session ID
            db: Database session (injected by FastAPI)
        """

        try:
            # Get or create conversation
            conversation = ConversationDB.get_or_create_conversation(db, session_id)

            # ═══════════════════════════════════════════════════
            # 🛠️ HANDLE SPECIAL ACTIONS
            # ═══════════════════════════════════════════════════
            if action == "clear_context":
                ContextDB.clear_chunks(db, conversation.id)
                return {
                    "status": "success",
                    "action": "context_cleared",
                    "session_id": conversation.session_id,
                    "message": "Context cleared successfully",
                }

            elif action == "get_context":
                chunks = ContextDB.get_chunks(db, conversation.id)
                latest_file = FileDB.get_latest_file(db, conversation.id)

                if not chunks and not latest_file:
                    return {
                        "status": "empty",
                        "session_id": conversation.session_id,
                        "has_context": False,
                    }

                response = {
                    "status": "active",
                    "session_id": conversation.session_id,
                    "has_context": True,
                    "chunks_count": len(chunks),
                }

                if latest_file:
                    response["file"] = {
                        "filename": latest_file.filename,
                        "type": latest_file.file_type.value,
                        "size": latest_file.file_size,
                    }

                return response

            elif action == "get_history":
                messages = MessageDB.get_conversation_messages(db, conversation.id)
                return {
                    "status": "success",
                    "session_id": conversation.session_id,
                    "messages": [
                        {
                            "role": msg.role.value,
                            "content": msg.content,
                            "model": msg.model_used,
                            "created_at": str(msg.created_at),
                        }
                        for msg in messages
                    ],
                }

            elif action == "get_conversations":
                conversations = ConversationDB.get_all_conversations(db)
                return {
                    "status": "success",
                    "conversations": [
                        {
                            "session_id": conv.session_id,
                            "title": conv.title,
                            "created_at": str(conv.created_at),
                            "message_count": len(conv.messages),
                        }
                        for conv in conversations
                    ],
                }

            # ═══════════════════════════════════════════════════
            # 📁 HANDLE FILE UPLOAD
            # ═══════════════════════════════════════════════════
            if file:
                content = await file.read()
                if not content:
                    raise HTTPException(status_code=400, detail="Empty file")

                file_type = ChatBot.get_file_type(file.filename)
                print(f"📁 File: {file.filename} (type: {file_type.value})")

                # Process based on file type
                if file_type == FileType.PDF:
                    text = await ChatBot.extract_text_from_pdf(content)
                    chunks = [text[i : i + 500] for i in range(0, len(text), 500)]

                    # Save to database
                    FileDB.create_file(
                        db,
                        conversation.id,
                        file.filename,
                        file_type,
                        file_size=len(content),
                        text_content=text,
                        chunks_count=len(chunks),
                    )
                    ContextDB.save_chunks(db, conversation.id, chunks)

                    if not message:
                        return {
                            "status": "success",
                            "session_id": conversation.session_id,
                            "message": f"PDF '{file.filename}' uploaded!",
                            "chunks_count": len(chunks),
                        }

                elif file_type == FileType.IMAGE:
                    base64_image = base64.b64encode(content).decode("utf-8")
                    ext = file.filename.lower().split(".")[-1]
                    media_type = {
                        "jpg": "image/jpeg",
                        "jpeg": "image/jpeg",
                        "png": "image/png",
                        "webp": "image/webp",
                        "gif": "image/gif",
                        "bmp": "image/bmp",
                    }.get(ext, "image/jpeg")

                    # Save to database
                    FileDB.create_file(
                        db,
                        conversation.id,
                        file.filename,
                        file_type,
                        file_size=len(content),
                        is_image=True,
                        image_base64=base64_image,
                        media_type=media_type,
                    )

                    if not message:
                        return {
                            "status": "success",
                            "session_id": conversation.session_id,
                            "message": f"Image '{file.filename}' uploaded!",
                            "size_bytes": len(content),
                        }

                elif file_type == FileType.TEXT:
                    text = content.decode("utf-8")
                    chunks = [text[i : i + 500] for i in range(0, len(text), 500)]

                    FileDB.create_file(
                        db,
                        conversation.id,
                        file.filename,
                        file_type,
                        file_size=len(content),
                        text_content=text,
                        chunks_count=len(chunks),
                    )
                    ContextDB.save_chunks(db, conversation.id, chunks)

                    if not message:
                        return {
                            "status": "success",
                            "session_id": conversation.session_id,
                            "message": f"Text file '{file.filename}' uploaded!",
                            "chunks_count": len(chunks),
                        }

                elif file_type == FileType.WORD:
                    text = await ChatBot.extract_text_from_word(content)
                    chunks = [text[i : i + 500] for i in range(0, len(text), 500)]

                    FileDB.create_file(
                        db,
                        conversation.id,
                        file.filename,
                        file_type,
                        file_size=len(content),
                        text_content=text,
                        chunks_count=len(chunks),
                    )
                    ContextDB.save_chunks(db, conversation.id, chunks)

                    if not message:
                        return {
                            "status": "success",
                            "session_id": conversation.session_id,
                            "message": f"Word document '{file.filename}' uploaded!",
                            "chunks_count": len(chunks),
                        }

            # ═══════════════════════════════════════════════════
            # 💬 HANDLE MESSAGE/QUESTION
            # ═══════════════════════════════════════════════════
            if message:
                # Save user message
                MessageDB.create_message(db, conversation.id, MessageRole.USER, message)

                client = get_groq_client()
                if not client:
                    raise HTTPException(status_code=500, detail="Groq API missing")

                # Get latest file and chunks
                latest_file = FileDB.get_latest_file(db, conversation.id)
                chunks = ContextDB.get_chunks(db, conversation.id, limit=3)

                # IMAGE ANALYSIS
                if latest_file and latest_file.is_image:
                    print(f"📸 Analyzing: {latest_file.filename}")

                    messages_ai = [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": message},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{latest_file.media_type};base64,{latest_file.image_base64}"
                                    },
                                },
                            ],
                        }
                    ]

                    answer, model_used = await ChatBot.call_ai_with_fallback(
                        client, "vision", messages_ai
                    )

                    # Save assistant response
                    MessageDB.create_message(
                        db,
                        conversation.id,
                        MessageRole.ASSISTANT,
                        answer,
                        model_used=model_used,
                        mode="image_analysis",
                    )

                    return {
                        "answer": answer,
                        "session_id": conversation.session_id,
                        "source": latest_file.filename,
                        "mode": "image_analysis",
                        "model_used": model_used,
                    }

                # DOCUMENT ANALYSIS
                elif chunks:
                    context = "\n\n".join(chunks)
                    print(f"📄 Using chunks from conversation")

                    messages_ai = [
                        {
                            "role": "system",
                            "content": "Answer based on document context. Be accurate.",
                        },
                        {
                            "role": "user",
                            "content": f"""Document Context:\n{context}\n\nQuestion: {message}""",
                        },
                    ]

                    answer, model_used = await ChatBot.call_ai_with_fallback(
                        client, "document", messages_ai
                    )

                    MessageDB.create_message(
                        db,
                        conversation.id,
                        MessageRole.ASSISTANT,
                        answer,
                        model_used=model_used,
                        mode="document_analysis",
                    )

                    return {
                        "answer": answer,
                        "session_id": conversation.session_id,
                        "source": latest_file.filename if latest_file else "document",
                        "mode": "document_analysis",
                        "model_used": model_used,
                    }

                # GENERAL CHAT
                else:
                    print("💬 General chat mode")

                    messages_ai = [
                        {
                            "role": "system",
                            "content": "You are a helpful AI assistant.",
                        },
                        {"role": "user", "content": message},
                    ]

                    answer, model_used = await ChatBot.call_ai_with_fallback(
                        client, "chat", messages_ai
                    )

                    MessageDB.create_message(
                        db,
                        conversation.id,
                        MessageRole.ASSISTANT,
                        answer,
                        model_used=model_used,
                        mode="general_chat",
                    )

                    return {
                        "answer": answer,
                        "session_id": conversation.session_id,
                        "mode": "general_chat",
                        "model_used": model_used,
                    }

            raise HTTPException(
                status_code=400, detail="Provide a message, file, or action parameter"
            )

        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback

            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

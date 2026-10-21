from pathlib import Path
from uuid import UUID
from fastapi import UploadFile

BASE_UPLOAD_DIR =Path("uploads/tickets")

async def save_tickets_message_file(
    ticket_id: UUID,
    message_id:UUID,
    file:UploadFile
)-> tuple[str, int]:
    
    upload_dir = (BASE_UPLOAD_DIR/str(ticket_id)/"messages"/str(message_id))

    upload_dir.mkdir(parents=True, exist_ok=True)

    if file.filename is None:
        raise ValueError("Uploaded file must have a filename")

    file_path = upload_dir / file.filename

    file_size= 0

    with file_path.open("wb") as buffer:
        while chunk := await file.read(1024*1024):
            file_size += len(chunk)
            buffer.write(chunk)

    return str(file_path), file_size
    
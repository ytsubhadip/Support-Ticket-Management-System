from pathlib import Path
from uuid import UUID
from fastapi import UploadFile

BASE_UPLOAD_DIR = Path("uploads/tickets")


async def save_ticket_message_file(
    ticket_id: UUID,
    file: UploadFile,
) -> tuple[str, int]:

    upload_dir = (
        BASE_UPLOAD_DIR
        / str(ticket_id)
        / "attachments"
    )

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = upload_dir / file.filename

    file_size = 0

    with file_path.open("wb") as buffer:

        while chunk := await file.read(1024 * 1024):

            file_size += len(chunk)

            buffer.write(chunk)

    return str(file_path), file_size
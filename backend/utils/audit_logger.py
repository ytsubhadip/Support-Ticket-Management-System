from models.audit_log import AuditLog


def create_audit_log(
    db,
    user_id,
    action,
    object_type,
    object_id=None,
    old_value=None,
    new_value=None,
    ip_address=None
):
    audit = AuditLog(

        user_id=user_id,
        action=action,
        object_type=object_type,
        object_id=str(object_id) if object_id else None,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address
    )

    db.add(audit)

    return audit
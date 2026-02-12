from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User
from app.auth import decode_token

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa đăng nhập"
        )
    
    # Remove "Bearer " prefix
    if token.startswith("Bearer "):
        token = token[7:]
    
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại"
        )
    
    return user

async def get_optional_user(request: Request, db: Session = Depends(get_db)):
    try:
        return await get_current_user(request, db)
    except HTTPException:
        return None

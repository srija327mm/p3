from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request):
    return Response({"csrfToken": get_token(request)})


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    if request.user.is_authenticated:
        return Response(_user_payload(request.user))
    return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""
    email = (request.data.get("email") or "").strip()

    if not username or not password:
        return Response({"detail": "username and password required"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "username already taken"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    login(request, user)
    return Response(_user_payload(user), status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"detail": "invalid credentials"}, status=400)
    login(request, user)
    return Response(_user_payload(user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "logged out"})

from django.urls import path
from .views import PasswordEntryListCreateView, PasswordEntryDetailView

urlpatterns = [
    path('passwords/', PasswordEntryListCreateView.as_view(), name='password-list-create'),
    path('passwords/<int:pk>/', PasswordEntryDetailView.as_view(), name='password-detail'),
]

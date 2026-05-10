from django.urls import path
from .views import EnglishEntryListCreateView, EnglishEntryDetailView

urlpatterns = [
    path('english/', EnglishEntryListCreateView.as_view(), name='english-list-create'),
    path('english/<int:pk>/', EnglishEntryDetailView.as_view(), name='english-detail'),
]

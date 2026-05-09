from django.urls import path
from .views import IdeaListCreateView, IdeaDetailView

urlpatterns = [
    path('ideas/', IdeaListCreateView.as_view(), name='idea-list-create'),
    path('ideas/<int:pk>/', IdeaDetailView.as_view(), name='idea-detail'),
]

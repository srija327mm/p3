from django.urls import path
from .views import LearningListCreateView, LearningDetailView

urlpatterns = [
    path('learning/', LearningListCreateView.as_view(), name='learning-list-create'),
    path('learning/<int:pk>/', LearningDetailView.as_view(), name='learning-detail'),
]

from django.urls import path
from .views import DrawingListCreateView, DrawingDetailView

urlpatterns = [
    path('drawings/', DrawingListCreateView.as_view(), name='drawing-list-create'),
    path('drawings/<int:pk>/', DrawingDetailView.as_view(), name='drawing-detail'),
]

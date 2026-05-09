from django.urls import path
from .views import BucketItemListCreateView, BucketItemDetailView

urlpatterns = [
    path('bucketlist/', BucketItemListCreateView.as_view(), name='bucket-list-create'),
    path('bucketlist/<int:pk>/', BucketItemDetailView.as_view(), name='bucket-detail'),
]

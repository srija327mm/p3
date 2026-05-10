from rest_framework import generics
from .models import BucketItem
from .serializers import BucketItemSerializer


class BucketItemListCreateView(generics.ListCreateAPIView):
    serializer_class = BucketItemSerializer

    def get_queryset(self):
        return BucketItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BucketItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BucketItemSerializer

    def get_queryset(self):
        return BucketItem.objects.filter(user=self.request.user)

from rest_framework import generics
from .models import Drawing
from .serializers import DrawingSerializer


class DrawingListCreateView(generics.ListCreateAPIView):
    serializer_class = DrawingSerializer

    def get_queryset(self):
        return Drawing.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DrawingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DrawingSerializer

    def get_queryset(self):
        return Drawing.objects.filter(user=self.request.user)

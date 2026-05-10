from rest_framework import generics
from .models import Drawing
from .serializers import DrawingSerializer


class DrawingListCreateView(generics.ListCreateAPIView):
    queryset = Drawing.objects.all()
    serializer_class = DrawingSerializer


class DrawingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Drawing.objects.all()
    serializer_class = DrawingSerializer

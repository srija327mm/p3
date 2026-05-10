from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Idea
from .serializers import IdeaSerializer


class IdeaListCreateView(generics.ListCreateAPIView):
    serializer_class = IdeaSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IdeaSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

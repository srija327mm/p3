from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Idea
from .serializers import IdeaSerializer


class IdeaListCreateView(generics.ListCreateAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

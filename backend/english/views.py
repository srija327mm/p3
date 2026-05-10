from rest_framework import generics
from .models import EnglishEntry
from .serializers import EnglishEntrySerializer


class EnglishEntryListCreateView(generics.ListCreateAPIView):
    queryset = EnglishEntry.objects.all()
    serializer_class = EnglishEntrySerializer


class EnglishEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EnglishEntry.objects.all()
    serializer_class = EnglishEntrySerializer

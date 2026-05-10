from rest_framework import generics
from .models import PasswordEntry
from .serializers import PasswordEntrySerializer


class PasswordEntryListCreateView(generics.ListCreateAPIView):
    queryset = PasswordEntry.objects.all()
    serializer_class = PasswordEntrySerializer


class PasswordEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PasswordEntry.objects.all()
    serializer_class = PasswordEntrySerializer

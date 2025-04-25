from rest_framework import generics
from .models import Client, Program
from .serializers import ClientSerializer, ProgramSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ClientDetailView(APIView):
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

# Client Views
class ClientListCreate(generics.ListCreateAPIView):
    queryset = Client.objects.all().select_related('program')
    serializer_class = ClientSerializer

class ClientRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all().select_related('program')
    serializer_class = ClientSerializer

# Program Views (keep your existing ones)
class ProgramListCreate(generics.ListCreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

class ProgramRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
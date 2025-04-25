from rest_framework import serializers
from .models import Client, Program

class ClientSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    active_programs = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone',
            'date_of_birth', 'address', 'program', 'program_name',
            'active_programs', 'created_at'
        ]
        extra_kwargs = {
            'program': {'required': False}
        }

    def get_active_programs(self, obj):
        return Program.objects.filter(status='active').values('id', 'name')

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'description', 'duration', 'category', 'status']
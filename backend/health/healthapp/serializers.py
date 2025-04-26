from rest_framework import serializers
from .models import Client, Program
from django.contrib.auth import authenticate
from django.contrib.auth.models import User


from django.contrib.auth.models import User

class SuperUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': False},
            'email': {'required': False}
        }

    def update(self, instance, validated_data):
        # Handle password separately to ensure hashing
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
            validated_data.pop('password')
        return super().update(instance, validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        # Try to find a user with this email as username
        try:
            user = User.objects.get(email=data['email'])
            user = authenticate(username=user.username, password=data['password'])
        except User.DoesNotExist:
            user = None
        
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        return {
            'user': user
        }

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
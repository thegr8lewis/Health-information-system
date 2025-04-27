from rest_framework import serializers
from .models import Client, Program
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.models import User
from .models import AdminCreationLog


class AdminCreationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_staff=True  # Ensure user is created as staff/admin
        )
        return user
# Add to serializers.py
class AdminCreationLogSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    new_admin_username = serializers.CharField(source='new_admin.username', read_only=True)
    created_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p")
    
    class Meta:
        model = AdminCreationLog
        fields = ['creator_username', 'new_admin_username', 'created_at']

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'description', 'duration', 'category', 'status']

class ClientProfileSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'date_of_birth',
            'address',
            'program',
            'created_at',
            'updated_at'
        ]

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
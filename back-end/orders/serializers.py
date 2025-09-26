from rest_framework import serializers
from .models import Order, OrderItem, Payment
from menu.serializers import DishSerializer
from tables.serializers import TableSerializer
from users.serializers import UserSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    dish = DishSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    table = TableSerializer(read_only=True)
    waiter = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
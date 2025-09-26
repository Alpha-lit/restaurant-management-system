from rest_framework import serializers
from .models import DailySales, PopularDish
from menu.serializers import DishSerializer

class DailySalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySales
        fields = '__all__'

class PopularDishSerializer(serializers.ModelSerializer):
    dish = DishSerializer(read_only=True)
    
    class Meta:
        model = PopularDish
        fields = '__all__'
from rest_framework import serializers
from .models import Category, Dish, Ingredient, DishIngredient

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

class DishIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    
    class Meta:
        model = DishIngredient
        fields = ('ingredient', 'quantity')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class DishSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    ingredients = DishIngredientSerializer(source='dishingredient_set', many=True, read_only=True)
    
    # Add write-only fields for updating
    category_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Dish
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def update(self, instance, validated_data):
        # Extract category_id if provided
        category_id = validated_data.pop('category_id', None)
        
        # Update the instance with the remaining validated data
        instance = super().update(instance, validated_data)
        
        # Update category if provided
        if category_id is not None:
            instance.category_id = category_id
            instance.save()
        
        return instance
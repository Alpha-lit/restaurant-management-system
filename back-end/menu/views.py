from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Dish, Ingredient, DishIngredient
from .serializers import CategorySerializer, DishSerializer, IngredientSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name']
    search_fields = ['name', 'description']

class DishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name', 'preparation_time']
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Handle ingredients separately
        ingredients_data = []
        for key, value in request.data.items():
            if key.startswith('ingredients['):
                # Parse the key to get index and field name
                # Example: ingredients[0].ingredient -> index=0, field=ingredient
                import re
                match = re.match(r'ingredients\[(\d+)\]\.(.+)', key)
                if match:
                    index = int(match.group(1))
                    field = match.group(2)
                    if len(ingredients_data) <= index:
                        ingredients_data.extend([{}] * (index - len(ingredients_data) + 1))
                    ingredients_data[index][field] = value
        
        # Update the dish
        self.perform_update(serializer)
        
        # Update ingredients if provided
        if ingredients_data:
            # Remove existing ingredients
            DishIngredient.objects.filter(dish=instance).delete()
            
            # Create new ingredients
            for data in ingredients_data:
                ingredient_id = data.get('ingredient')
                quantity = data.get('quantity')
                if ingredient_id and quantity:
                    DishIngredient.objects.create(
                        dish=instance,
                        ingredient_id=ingredient_id,
                        quantity=quantity
                    )
        
        return Response(serializer.data)

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name']
    search_fields = ['name']
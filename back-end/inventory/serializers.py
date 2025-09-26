from rest_framework import serializers
from .models import Stock, StockTransaction

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'
    
    def validate(self, attrs):
        # If we're updating, get the current instance
        if self.instance is not None:
            # If ingredient is not provided in the update, use the current one
            if 'ingredient' not in attrs:
                attrs['ingredient'] = self.instance.ingredient
        return super().validate(attrs)

class StockTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransaction
        fields = '__all__'
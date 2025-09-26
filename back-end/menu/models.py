from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    
    def __str__(self):
        return self.name

class Ingredient(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, help_text="e.g., kg, g, l, ml")
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} ({self.unit})"

class Dish(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='dishes')
    ingredients = models.ManyToManyField(Ingredient, through='DishIngredient')
    image = models.ImageField(upload_to='dish_images/', blank=True, null=True)
    available = models.BooleanField(default=True)
    preparation_time = models.PositiveIntegerField(help_text="in minutes")
    calories = models.PositiveIntegerField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class DishIngredient(models.Model):
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    
    class Meta:
        unique_together = ('dish', 'ingredient')
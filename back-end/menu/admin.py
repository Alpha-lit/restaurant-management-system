from django.contrib import admin
from .models import Category, Dish, Ingredient, DishIngredient

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit', 'cost_per_unit')
    search_fields = ('name',)
    list_filter = ('unit',)

class DishIngredientInline(admin.TabularInline):
    model = DishIngredient
    extra = 1

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'available', 'preparation_time')
    list_filter = ('category', 'available')
    search_fields = ('name', 'description')
    inlines = [DishIngredientInline]
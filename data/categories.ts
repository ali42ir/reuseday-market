
import type { Category } from '../types.ts';

export const categoryData: Category[] = [
  {
    id: 'electronics',
    nameKey: 'category_electronics',
    subcategories: [
      { id: 'electronics-phones', nameKey: 'subcategory_electronics_phones' },
      { id: 'electronics-tvs', nameKey: 'subcategory_electronics_tvs' },
      { id: 'electronics-computers', nameKey: 'subcategory_electronics_computers' },
      { id: 'electronics-appliances', nameKey: 'subcategory_electronics_appliances' },
    ],
  },
  {
    id: 'furniture',
    nameKey: 'category_furniture',
    subcategories: [
      { id: 'furniture-chairs', nameKey: 'subcategory_furniture_chairs' },
      { id: 'furniture-tables', nameKey: 'subcategory_furniture_tables' },
      { id: 'furniture-storage', nameKey: 'subcategory_furniture_storage' },
    ],
  },
  {
    id: 'clothing',
    nameKey: 'category_clothing',
    subcategories: [
      { id: 'clothing-men', nameKey: 'subcategory_clothing_men' },
      { id: 'clothing-women', nameKey: 'subcategory_clothing_women' },
      { id: 'clothing-kids', nameKey: 'subcategory_clothing_kids' },
      { id: 'clothing-shoes', nameKey: 'subcategory_clothing_shoes' },
    ],
  },
  {
    id: 'home-kitchen',
    nameKey: 'category_home_kitchen',
    subcategories: [
      { id: 'home-kitchen-cookware', nameKey: 'subcategory_home_kitchen_cookware' },
      { id: 'home-kitchen-decor', nameKey: 'subcategory_home_kitchen_decor' },
      { id: 'home-kitchen-dining', nameKey: 'subcategory_home_kitchen_dining' },
    ],
  },
  {
    id: 'sports-outdoors',
    nameKey: 'category_sports_outdoors',
    subcategories: [
      { id: 'sports-outdoors-bicycles', nameKey: 'subcategory_sports_outdoors_bicycles' },
      { id: 'sports-outdoors-camping', nameKey: 'subcategory_sports_outdoors_camping' },
      { id: 'sports-outdoors-fitness', nameKey: 'subcategory_sports_outdoors_fitness' },
    ],
  },
  { id: 'toys-games', nameKey: 'category_toys_games', subcategories: [] },
  { id: 'books-media', nameKey: 'category_books_media', subcategories: [] },
  { id: 'tools-diy', nameKey: 'category_tools_diy', subcategories: [] },
  { id: 'free-stuff', nameKey: 'category_free_stuff', subcategories: [] },
  { id: 'other', nameKey: 'category_other', subcategories: [] },
];

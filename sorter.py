import json

def sort_categories(data):
    # Sorts the categories by title_text, case-insensitively
    def get_sort_key(category):
        title_text = category.get('title_text', '') # Use .get for safety
        # Clean the title text for robust sorting (remove non-alphanumeric, lower, strip)
        # This was the intention of the original sorter's cleaned_title logic
        cleaned_title_for_sort = ''.join(char for char in title_text if char.isalnum() or char.isspace())
        return cleaned_title_for_sort.strip().lower()

    data.sort(key=get_sort_key)
    return data

if __name__ == '__main__':
    try:
        with open('parsed_data.json', 'r', encoding='utf-8') as f:
            categories_data = json.load(f)
    except FileNotFoundError:
        print("Error: parsed_data.json not found. Please ensure the previous parsing step was successful.")
        exit(1)
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from parsed_data.json.")
        exit(1)

    if not categories_data:
        print("Warning: parsed_data.json is empty or not a list of categories.")
        # Create an empty sorted_categories.json or handle as an error
        with open('sorted_categories.json', 'w', encoding='utf-8') as outfile:
            json.dump([], outfile, indent=4)
        print("Empty sorted_categories.json created.")
        exit(0)

    # Ensure each item is a dictionary and has 'title_text'
    for item in categories_data:
        if not isinstance(item, dict) or 'title_text' not in item:
            print(f"Error: Invalid item found in parsed_data.json: {item}")
            print("Ensure parser.py is correctly creating 'title_text' for each category.")
            exit(1)

    sorted_data = sort_categories(categories_data)

    with open('sorted_categories.json', 'w', encoding='utf-8') as outfile:
        json.dump(sorted_data, outfile, indent=4)

    print("Categories sorted alphabetically (using title_text) and saved to sorted_categories.json")

from bs4 import BeautifulSoup, Tag

def sort_service_links_in_html(html_content):
    soup = BeautifulSoup(html_content, 'lxml')

    category_sections = soup.find_all('section', class_='category')
    if not category_sections:
        print("No category sections found.")
        return None

    for section in category_sections:
        category_name_tag = section.find('h2')
        category_name_for_log = category_name_tag.get_text(strip=True).split('\n')[0].strip() if category_name_tag else "Unknown Category"

        category_content = section.find('div', class_='category-content')
        if not category_content:
            print(f"No 'category-content' div found in category: {category_name_for_log}")
            continue

        # Detach all direct children (service_buttons and intervening NavigableString newlines)
        original_children = list(category_content.children)
        for child in original_children:
            child.extract()

        # Separate actual <a> tags from other elements like NavigableStrings (newlines/whitespace)
        service_button_tags = [child for child in original_children if isinstance(child, Tag) and child.name == 'a' and 'service-button' in child.get('class', [])]
        other_elements = [child for child in original_children if not (isinstance(child, Tag) and child.name == 'a' and 'service-button' in child.get('class', []))]

        def get_service_name(service_button_tag):
            name_tag = service_button_tag.find('span', class_='service-name')
            return name_tag.get_text(strip=True).lower() if name_tag else "" # Use .lower() for case-insensitive sort

        sorted_service_button_tags = sorted(service_button_tags, key=get_service_name)

        # Reconstruct the content. This simple append might not perfectly preserve original spacing
        # if there were complex arrangements of newlines, but it will put sorted buttons back.
        # The original HTML structure is <a>\n<a>\n...
        # We need to add newline characters between the appended buttons.

        # Clear the category_content again before appending sorted items
        # This is redundant if .clear() was used or if children were properly extracted,
        # but as a safeguard:
        for child in list(category_content.children):
            child.extract()

        for i, button in enumerate(sorted_service_button_tags):
            category_content.append(button)
            # Add a newline text node after each button, except the last one, if desired for formatting.
            # The original HTML had a newline and specific indentation.
            if i < len(sorted_service_button_tags) - 1:
                category_content.append('\n                ') # Matches original newline and typical indentation

        # Add a final newline if the div originally ended with one, before the closing tag
        if sorted_service_button_tags:
             category_content.append('\n            ')


    print(f"Completed sorting links alphabetically by service name for all {len(category_sections)} categories.")
    return soup

if __name__ == '__main__':
    original_html_path = 'index.html'
    output_html_path = 'index.html' # Overwrite the original file

    try:
        with open(original_html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: {original_html_path} not found.")
        exit(1)

    modified_soup = sort_service_links_in_html(html_content)

    if modified_soup:
        try:
            with open(output_html_path, 'w', encoding='utf-8') as f:
                # Using prettify() can help make the output cleaner but might alter spacing.
                # To preserve as much as possible, just convert soup to string.
                f.write(str(modified_soup))
            print(f"Sorted HTML content saved to {output_html_path}")
        except Exception as e:
            print(f"Error saving sorted HTML to {output_html_path}: {e}")
    else:
        print("Sorting failed or produced no result. File not saved.")

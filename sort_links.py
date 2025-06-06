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

        service_buttons = category_content.find_all('a', class_='service-button', recursive=False)

        # Detach existing buttons before sorting and re-adding
        for button in service_buttons:
            button.extract() # Removes the tag from the tree but keeps it in memory

        def get_service_name(service_button_tag):
            name_tag = service_button_tag.find('span', class_='service-name')
            return name_tag.get_text(strip=True) if name_tag else ""

        # Sort the detached Tag objects
        # Filter out any elements that are not Tags (e.g. NavigableStrings like newlines)
        # that might have been picked up if recursive=True was used or if structure is unexpected.
        # With recursive=False on find_all, this should mostly be Tags, but good practice.
        tag_buttons = [b for b in service_buttons if isinstance(b, Tag)]
        sorted_service_buttons = sorted(tag_buttons, key=get_service_name)

        # Append sorted buttons back to the category_content div
        # Also add back newline characters between buttons for readability if desired,
        # matching the original structure if it had them.
        for i, button in enumerate(sorted_service_buttons):
            category_content.append(button)
            # If not the last button, add a newline character back if it was there.
            # The original HTML has newlines between <a> tags.
            if i < len(sorted_service_buttons) - 1:
                 category_content.append('\n                ') # Match original indentation/newline

        # Add a final newline if the div originally ended with one before the closing tag
        if sorted_service_buttons: # only if there were buttons
            category_content.append('\n            ')


    print(f"Completed sorting links alphabetically by service name for all {len(category_sections)} categories.")
    return soup # Return the modified soup object

if __name__ == '__main__':
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print("Error: index.html not found.")
        exit(1)

    modified_soup = sort_service_links_in_html(html_content)

    if modified_soup:
        # In a real scenario, you'd save this modified_soup to a file
        # For this step, we just need to confirm sorting is done.
        # print("\nFirst few lines of modified HTML (for verification):")
        # print(str(modified_soup)[:500]) # Print a snippet
        pass

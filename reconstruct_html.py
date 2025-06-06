import json
from bs4 import BeautifulSoup

def reconstruct_html(original_html_content, sorted_data):
    soup = BeautifulSoup(original_html_content, 'html.parser')

    main_tag = soup.find('main')
    if not main_tag:
        raise ValueError("Could not find <main> tag in the original HTML.")

    # Remove existing category sections
    for category_section in main_tag.find_all('section', class_='category'):
        category_section.decompose()

    # Reconstruct and append sorted category sections
    # The search container is assumed to be the first child of main or handled if it's outside.
    # If search is inside main and should be first, we find it and insert sections after it.
    search_container = main_tag.find('div', class_='search-container')

    insert_after_tag = search_container if search_container else None

    for category_data in sorted_data:
        # Create the section tag
        new_section_tag = soup.new_tag('section', attrs={'class': 'category'})
        if category_data.get('id'):
            new_section_tag['id'] = category_data['id']

        # Add the original H2 tag
        h2_html = category_data.get('title_html', f'<h2>{category_data.get("title_text", "Untitled")} <span class="chevron">▼</span></h2>')
        h2_soup = BeautifulSoup(h2_html, 'html.parser')
        new_section_tag.append(h2_soup.find('h2')) # Append the h2 tag itself

        # Create the category content div
        category_content_div = soup.new_tag('div', class_='category-content')

        for service in category_data.get('services', []):
            service_html = service.get('html', '')
            service_soup = BeautifulSoup(service_html, 'html.parser')
            if service_soup.find('a', class_='service-button'):
                 category_content_div.append(service_soup.find('a', class_='service-button'))

        new_section_tag.append(category_content_div)

        if insert_after_tag:
            insert_after_tag.insert_after(new_section_tag)
            insert_after_tag = new_section_tag # Next section will be inserted after this one
        elif main_tag.contents: # If no search bar, insert at the beginning or end
            main_tag.insert(0, new_section_tag) # Or main_tag.append(new_section_tag) depending on desired order
        else:
            main_tag.append(new_section_tag)


    return soup.prettify() # Return the modified HTML string

if __name__ == '__main__':
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            original_html = f.read()
    except FileNotFoundError:
        print("Error: index.html not found.")
        exit(1)

    try:
        with open('final_sorted_data.json', 'r', encoding='utf-8') as f:
            sorted_categories_data = json.load(f)
    except FileNotFoundError:
        print("Error: final_sorted_data.json not found. Ensure previous steps were successful.")
        exit(1)
    except json.JSONDecodeError:
        print("Error: Could not decode JSON from final_sorted_data.json.")
        exit(1)

    updated_html_content = reconstruct_html(original_html, sorted_categories_data)

    with open('updated_index.html', 'w', encoding='utf-8') as outfile:
        outfile.write(updated_html_content)

    print("HTML reconstructed with sorted categories and services, saved to updated_index.html")

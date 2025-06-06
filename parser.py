import json
from bs4 import BeautifulSoup

def parse_html_content(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    categories_data = []

    for category_section in soup.find_all('section', class_='category'):
        section_id = category_section.get('id', '')
        h2_tag = category_section.find('h2')
        category_title_full_html = str(h2_tag) if h2_tag else ''

        # Extract clean title for sorting and display (if needed elsewhere, though not strictly for this script)
        category_title_text = h2_tag.get_text(strip=True) if h2_tag else 'N/A'
        # Clean title for sorting key if needed (example: removing non-alphanumeric for a cleaner key)
        # For now, the actual title from H2 is used for display, sorting will handle it.

        services_data = []
        service_buttons_container = category_section.find('div', class_='category-content')
        if service_buttons_container:
            service_buttons = service_buttons_container.find_all('a', class_='service-button')
            for service_button in service_buttons:
                service_name_tag = service_button.find('span', class_='service-name')
                service_name = service_name_tag.get_text(strip=True) if service_name_tag else 'N/A'
                service_html = str(service_button)
                services_data.append({
                    'name': service_name,
                    'html': service_html
                })

        categories_data.append({
            'id': section_id,
            'title_html': category_title_full_html, # Store full H2 HTML
            'title_text': category_title_text, # Store clean text for sorting
            'services': services_data
        })

    return categories_data

if __name__ == '__main__':
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    parsed_data = parse_html_content(html_content)

    with open('parsed_data.json', 'w', encoding='utf-8') as outfile:
        json.dump(parsed_data, outfile, indent=4)

    print("Parsed data (with section IDs and H2 HTML) saved to parsed_data.json")

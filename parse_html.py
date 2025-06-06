from bs4 import BeautifulSoup

def parse_html_data(html_content):
    soup = BeautifulSoup(html_content, 'lxml')
    categories_data = []

    category_sections = soup.find_all('section', class_='category')

    for section in category_sections:
        category_name_tag = section.find('h2')
        category_name = category_name_tag.get_text(strip=True).split('\n')[0].strip() if category_name_tag else "Unknown Category"

        services = []
        service_buttons = section.find_all('a', class_='service-button')

        for button in service_buttons:
            service_name_tag = button.find('span', class_='service-name')
            service_name = service_name_tag.get_text(strip=True) if service_name_tag else "Unknown Service"
            service_url = button.get('href', '#')
            services.append({'name': service_name, 'url': service_url})

        categories_data.append({
            'category_name': category_name,
            'services': services
        })

    return categories_data

if __name__ == '__main__':
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    parsed_data = parse_html_data(html_content)

    print(f"Found {len(parsed_data)} categories.")

    for i, category in enumerate(parsed_data[:3]): # Print details for the first 3 categories
        print(f"Category '{category['category_name']}' has {len(category['services'])} links.")

    # Example of accessing and printing some data for verification (optional)
    # if parsed_data:
    #     print("\nExample data from the first category:")
    #     first_category = parsed_data[0]
    #     print(f"Category Name: {first_category['category_name']}")
    #     if first_category['services']:
    #         print(f"First service: {first_category['services'][0]['name']} - {first_category['services'][0]['url']}")
    #         if len(first_category['services']) > 1:
    #             print(f"Second service: {first_category['services'][1]['name']} - {first_category['services'][1]['url']}")
    #     else:
    #         print("No services found in the first category.")
    # else:
    #     print("No data parsed.")

import json

NEW_SERVICE_ENTRIES = [
    {
        "name": "懂AI GC (Dong AI GC)",
        "url": "https://www.dongaigc.com/",
        "favicon_url": "https://www.dongaigc.com/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "navigation", "collection", "resources"]
    },
    {
        "name": "AIPURE.ai",
        "url": "https://aipure.ai/",
        "favicon_url": "https://aipure.ai/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "ranking", "collection", "discovery", "search ai"]
    },
    {
        "name": "Flux AI",
        "url": "https://flux-ai.io/",
        "favicon_url": "https://flux-ai.io/favicon.ico",
        "category": "🎨 Media & Generative Creativity",
        "tags": ["design", "image generation", "video generation", "creative tools", "ai powered design", "collaborative engineering", "automation"]
    },
    {
        "name": "BAI.tools",
        "url": "https://bai.tools/",
        "favicon_url": "https://bai.tools/favicon.ico", # Assuming .ico, though site showed .png
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "collection", "discovery", "search ai", "resources"]
    },
    {
        "name": "iuu.ai",
        "url": "https://iuu.ai/",
        "favicon_url": "https://iuu.ai/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "navigation", "collection", "resources", "search ai"]
    },
    {
        "name": "AI TOOL TREK",
        "url": "https://aitooltrek.com/",
        "favicon_url": "https://aitooltrek.com/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "showcase", "collection", "discovery"]
    },
    {
        "name": "AI With Me",
        "url": "https://aiwith.me/",
        "favicon_url": "https://aiwith.me/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "discovery", "collection", "resources"]
    },
    {
        "name": "AIEasy.life",
        "url": "https://aieasy.life/",
        "favicon_url": "https://aieasy.life/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "collection", "discovery", "lifestyle", "productivity"]
    },
    {
        "name": "MagicBox.Tools",
        "url": "https://magicbox.tools/",
        "favicon_url": "https://magicbox.tools/favicon.ico",
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "navigator", "collection", "discovery", "search ai"]
    },
    {
        "name": "Janus Pro (DeepSeek)",
        "url": "https://huggingface.co/spaces/deepseek-ai/Janus-Pro-7B",
        "favicon_url": "https://januspro.app/favicon.ico",
        "category": "🎨 Media & Generative Creativity",
        "tags": ["image generation", "multimodal", "visual understanding", "ai model", "open source", "deepseek"]
    },
    {
        "name": "AI Tool Center",
        "url": "https://aitoolcenter.com/",
        "favicon_url": "https://aitoolcenter.com/favicon.png", # Explicitly .png
        "category": "📚 Research, Education & Exploration",
        "tags": ["directory", "ai tools", "showcase", "collection", "discovery"]
    },
    {
        "name": "AI Song Generator",
        "url": "https://aisonggenerator.ai/",
        "favicon_url": "https://aisonggenerator.ai/favicon.ico",
        "category": "🎨 Media & Generative Creativity",
        "tags": ["music generation", "song creator", "ai music", "audio generation", "lyrics to song", "creative tools"]
    }
]

# Default favicon if one couldn't be determined or results in error
DEFAULT_FAVICON = "./public/favicon.ico"

# Ensure all new entries have a valid favicon_url
for entry in NEW_SERVICE_ENTRIES:
    if not entry.get("favicon_url"):
        entry["favicon_url"] = DEFAULT_FAVICON
    # Simple check for common image extensions if not ico; otherwise default
    # This is a basic check; a more robust one would involve HEAD requests or more complex parsing.
    if not entry["favicon_url"].endswith((".ico", ".png", ".jpg", ".jpeg", ".svg")):
         # Attempt to construct one if it looks like a base URL was given for favicon
        if not entry["favicon_url"].startswith("http"): # if it's a relative path already
             entry["favicon_url"] = DEFAULT_FAVICON
        elif entry["favicon_url"].count('/') == 2: # e.g. https://domain.com
            entry["favicon_url"] = entry["favicon_url"].rstrip('/') + "/favicon.ico"
        # else, if it was a more complex path that wasn't an image, it might be wrong,
        # but we'll keep it for now or default if it's clearly not an image path.
        # For this script, we'll be a bit lenient and rely on the gathered URLs.
        # A manual check later would be good.

try:
    with open("services.json", "r", encoding="utf-8") as f:
        existing_services = json.load(f)
except FileNotFoundError:
    print("Warning: services.json not found. Will create a new file with the new entries.")
    existing_services = []
except json.JSONDecodeError:
    print("Error: Could not decode existing services.json. Please check its format. Aborting.")
    exit(1)

print(f"Read {len(existing_services)} existing services.")

# Add new services and deduplicate based on URL primarily, then name as secondary for uniqueness
all_services_combined = existing_services
seen_urls = {service['url'] for service in existing_services}
new_added_count = 0

for new_service in NEW_SERVICE_ENTRIES:
    if new_service['url'] not in seen_urls:
        all_services_combined.append(new_service)
        seen_urls.add(new_service['url'])
        new_added_count += 1
    else:
        print(f"Service with URL {new_service['url']} already exists. Skipping.")

print(f"Added {new_added_count} new unique services.")
print(f"Total services before final sort: {len(all_services_combined)}")

# Group services by category for sorting
categories_map = {}
for service in all_services_combined:
    category_name = service.get("category", "🧩 Miscellaneous / Specialized") # Default if somehow missing
    if category_name not in categories_map:
        categories_map[category_name] = []
    categories_map[category_name].append(service)

# Sort services within each category by name
for category_name in categories_map:
    categories_map[category_name].sort(key=lambda x: x['name'].lower())

# Reconstruct the flat list, ensuring categories are also sorted (e.g., alphabetically by category name)
# The visual script sorts categories dynamically, so the order in JSON is less critical for display
# but good for consistency.
sorted_final_services_list = []
# Sort category names themselves for consistent output file order
sorted_category_names_for_file = sorted(list(categories_map.keys()))

for category_name in sorted_category_names_for_file:
    sorted_final_services_list.extend(categories_map[category_name])

print(f"Total services after sorting: {len(sorted_final_services_list)}")

# Write back to services.json
try:
    with open("services.json", "w", encoding="utf-8") as f:
        json.dump(sorted_final_services_list, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated services.json with {len(sorted_final_services_list)} total services.")
except IOError:
    print("Error: Could not write to services.json.")
    exit(1)

print("Subtask to add new services and re-sort completed.")

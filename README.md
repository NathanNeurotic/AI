[![image](https://github.com/user-attachments/assets/a3a4311d-6ede-46ba-91aa-558b845d0b23)](https://nathanneurotic.github.com/AI)


# AI Services Dashboard

## Overview

The AI Services Dashboard is a static webpage designed to provide a curated list of AI services and tools, categorized for easy navigation. It features a clean, retro-terminal-inspired interface with search functionality and collapsible sections, ensuring a user-friendly experience on both desktop and mobile devices.

## Features

*   **Categorized Listings:** AI services are grouped into relevant categories (e.g., All-in-One AI Assistants, Image Generation, Video Generation).
*   **Quick Search:** Filter services by name or URL using the search bar.
*   **Collapsible Sections:** Easily expand and collapse categories to manage visibility.
*   **Direct Links:** Each service entry links directly to the respective service's website.
*   **Favicon Display:** Shows favicons for listed services for quick visual identification.
*   **Optional Thumbnails:** When provided, a small preview image is displayed above the service name.
*   **Offline Caching:** Favicons and thumbnails from `services.json` are cached for offline use.
*   **Responsive Design:** Optimized for various screen sizes, including mobile devices.
    *   Header text wraps correctly on narrow screens.
    *   Interactive elements are properly handled in collapsed sections on mobile.
*   **Persistent Category State:** Remembers which categories were left open or closed across sessions using browser localStorage.
*   **Themed Interface:** Retro-terminal aesthetic with a typing effect in the header. On first visit, the page follows your operating system's light or dark preference.
*   **Service Counts:** The header shows the total number of available services, and each category title displays how many entries it contains.
*   **Alphabetical Sorting:** Categories and services are automatically sorted alphabetically when `script.js` dynamically loads `services.json`.
*   **Favorites:** Mark services with the star icon to quickly access them in a dedicated "Favorites" category that persists using `localStorage`.
*   **Category View Toggle:** Each category can switch between grid and list layouts independently, and the choice is remembered.
*   **Device View Toggle:** Quickly switch between single-column mobile and multi-column desktop layouts using one button.
*   **View Preference Persistence:** Your mobile or desktop choice is saved in `localStorage` and reapplied on future visits.

## Getting Started

Follow these instructions to get a local copy of the AI Services Dashboard up and running on your machine.

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
*   Git for cloning the repository (optional, you can also download the source code as a ZIP file).
*   Node.js 18+ (recommended if you plan to run the tests).

### Installation & Local Setup

1.  **Clone the repository (if you have Git):**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    ```
    *(Replace `https://github.com/your-username/your-repository-name.git` with the actual URL of the repository).*

    Alternatively, download the ZIP file from the repository page on GitHub and extract it.

2.  **Navigate to the project directory:**
    ```bash
    cd your-repository-name
    ```
    *(Replace `your-repository-name` with the actual directory name).*

3.  **Install dependencies (required for linting and testing):**
    ```bash
    npm install
    ```

4.  **Open the site with a local server:**
    Features like the service worker and the install button only work when the page is served over HTTP.
    You can start a simple server from the project directory with:
    ```bash
    npx serve .
    # or
    python -m http.server
    ```
    Then visit the displayed URL (typically http://localhost:3000 or :8000).
    Opening `index.html` directly will disable PWA install features.

### Running Tests

If you have Node.js installed (version 18 or newer), **run `npm install` first** to install the dev dependencies.
Skipping this step will cause `npm test` to fail.
*Note: The tests require Node.js version 18 or later.*

```bash
npm install
```

This installs `jest` and `jsdom`. Once installed, run the unit tests with:

```bash
npm test
```

The tests use Jest with `jsdom` to verify functionality in `script.js`.
They cover category toggling and the search filtering behavior.

### Linting

As with testing, make sure you have run `npm install` before linting.
Then run ESLint to check for code quality issues:

```bash
npm run lint
```

The configuration uses the recommended rules for browser environments and includes overrides for the test suite.
If you encounter errors about mismatched ESLint versions, you might be using a globally installed `eslint`.
Use the local copy via `npm run lint` or `npx eslint` instead.

## Utility Scripts

Several Python scripts in the `scripts/` directory help manage and transform the
`services.json` data. Run them from the repository root so relative paths
resolve correctly.

| Script | Description | Example Command |
| ------ | ----------- | --------------- |
| `add_and_sort_services.py` | Adds the hard-coded `NEW_SERVICE_ENTRIES` to `services.json` and resorts the file. | `python scripts/add_and_sort_services.py` |
| `extract_original_categories.py` | Reads `services_at_parent.json` and writes unique category names to `original_categories.json`. | `python scripts/extract_original_categories.py` |
| `flatten_services.py` | Converts the nested category structure in `services.json` to a flat list of services. | `python scripts/flatten_services.py` |
| `parser.py` | Parses a text blob of services into `parsed_services.json`. | `python scripts/parser.py < input.txt` |
| `process_services.py` | Deduplicates services from `parsed_services.json` and merges them into `services.json`. | `python scripts/process_services.py` |
| `recategorize_services.py` | Example logic for mapping services to new categories; useful for experimentation. | `python scripts/recategorize_services.py` |
| `remap_services.py` | Maps services back to their original categories using `original_categories.json`. | `python scripts/remap_services.py` |
| `update_main_services.py` | Merges `new_services_processed.json` into `services.json` and removes duplicates. | `python scripts/update_main_services.py` |

## Using Favorites

Click the star icon next to any service to mark it as a favorite. Favorited services appear in the "Favorites" category directly below the search box. Your selections are stored locally in your browser's `localStorage`, so they remain available on future visits.

## Service Counts

When the page finishes loading, the main heading displays the total number of available services, such as `AI Services Dashboard (150 services)`. Every category heading also shows its own count in parentheses so you can see at a glance how many tools are in each section.

## Modifying the Site

The AI Services Dashboard is built with standard HTML, CSS, and JavaScript. Here's a brief overview of the file structure and how to make common modifications:

### File Structure

*   `index.html`: Mostly static HTML structure of the dashboard. Service listings are dynamically injected from `services.json` by `script.js`.
*   `styles.css`: The primary stylesheet responsible for the visual appearance, layout, and retro theme of the site.
*   `script.js`: Handles the typing effect, category toggling, search filtering, persistence of category states, and populates the page with data from `services.json`.
*   `services.json`: Stores the AI service data used to populate the dashboard.
*   `favicon.ico`: Site icon.
*   `README.md`: This file – providing information about the project.
*   `.github/workflows/static.yml`: GitHub Actions workflow for continuous deployment (e.g., to GitHub Pages).
*   `LICENSE`: Contains the MIT License text.
*   `CREDITS.md`: Lists acknowledgements for contributions or assistance.

### Adding or Editing Services

Service data is stored in `services.json`. To add a new service or update an existing one:

1.  Open `services.json` in a text editor.
2.  Add or edit an object in the JSON array with the fields `name`, `url`, `favicon_url`, and either `category` or `categories`. Use `category` when a service belongs to a single category, or `categories` to specify multiple category names. Optionally include `tags` for improved search results and a `thumbnail_url` to display a preview image.
    ```json
    {
        "name": "Example Service",
        "url": "https://example.com/",
        "favicon_url": "https://example.com/favicon.ico",
        "categories": [
            "💬 Language, Communication & Interaction",
            "💼 Enterprise & Productivity Solutions"
        ],
        "tags": ["example", "demo"],
        "thumbnail_url": "https://example.com/thumb.png"
    }
    ```
    Ensure the new entry follows the same format as shown above.
3.  Save the file. The site will automatically load the updated services when refreshed.

### Adding or Editing Categories

1.  Open `index.html`.
2.  To add a new category, you can copy an entire `<section class="category" id="new-category-id">...</section>` block.
3.  Change the `id` of the section to something unique and relevant (e.g., `id="my-new-category"`).
4.  Update the `<h2>` within the new section to reflect the category name:
    ```html
    <h2 onclick="toggleCategory(this)" aria-expanded="false">
        Your New Category Name
        <span class="chevron">▼</span>
    </h2>
    ```
5.  Populate the `<div class="category-content">` with service buttons as described above.

### Modifying Styles

*   All custom styles are in `styles.css`.
*   You can modify colors, fonts, spacing, layout, and other visual aspects by editing this file.
*   The styles are generally organized by element or component (e.g., `header`, `category`, `service-button`).
*   A built-in theme switcher toggles the `light-mode` class on `<body>` using `script.js` and remembers your choice in `localStorage`. If no theme is stored, the page defaults to your OS preference. Customize the default colors by changing the CSS variables defined at the top of `styles.css`.

### Modifying Functionality

*   Client-side JavaScript is in `script.js`.
*   This file handles:
    *   The typing animation in the header.
    *   The expand/collapse logic for categories (`toggleCategory` function).
    *   Saving and restoring category states using `localStorage`.
    *   The live search/filter functionality.
*   Be cautious when editing this file, as incorrect changes can break site features.

## Deployment

Since the AI Services Dashboard is a static website (HTML, CSS, JavaScript only), deploying it is straightforward. Here are a few common options:

### GitHub Pages

If your repository is hosted on GitHub, GitHub Pages is a free and convenient way to deploy your site.

1.  Ensure your main HTML file is named `index.html`.
2.  Go to your repository settings on GitHub.
3.  Navigate to the "Pages" section.
4.  Choose the branch you want to deploy from (usually `main` or `master`).
5.  Select the `/(root)` folder as the source.
6.  Save the changes. GitHub will build and deploy your site, providing you with a URL (e.g., `https://your-username.github.io/your-repository-name/`).

*Note: The repository already contains a GitHub Actions workflow file at `.github/workflows/static.yml` which is configured to automate deployment to GitHub Pages whenever changes are pushed to the main branch. You might not need to configure it manually as described above after the initial setup of your repository on GitHub Pages.*

### Other Static Hosting Providers

Many other platforms offer free or paid hosting for static websites:

*   **Netlify:** Offers drag-and-drop deployment, Git integration, and more.
*   **Vercel:** Known for its ease of use and integration with frontend frameworks (though not strictly necessary for a static site).
*   **AWS S3:** You can configure an S3 bucket to host a static website.
*   **Firebase Hosting:** Provides fast and secure hosting for static assets.
*   **Cloudflare Pages:** Offers robust global CDN and easy deployment.

For most of these services, you typically need to:
1.  Sign up for an account.
2.  Connect your Git repository or upload the files (`index.html`, `styles.css`, `script.js`, and any assets).
3.  Configure the build settings (usually minimal or none for a plain static site).
4.  Deploy.

## Installing the Dashboard as a PWA

You can install the AI Services Dashboard on your device for quick access:

1. Open the site in a modern browser such as Chrome or Edge.
2. Click the install icon in the address bar or choose **Install App** from the browser menu.
3. Confirm the prompt to add it to your home screen or applications list.

After installation the dashboard can be launched like a native application and works offline thanks to the service worker.
Favicons and thumbnails defined in `services.json` are now pre-cached during installation.

## Contributing

Contributions are welcome to enhance the AI Services Dashboard! If you have suggestions, bug reports, or want to add new services or features, please follow these steps:

1.  **Fork the Repository:** Create your own fork of the project on GitHub.
2.  **Create a New Branch:** Make your changes in a dedicated branch in your forked repository.
    ```bash
    git checkout -b your-feature-branch-name
    ```
3.  **Commit Your Changes:** Make sure your commit messages clearly describe the changes.
    ```bash
    git commit -m "Add: New feature or Fix: Description of fix"
    ```
4.  **Push to Your Branch:**
    ```bash
    git push origin your-feature-branch-name
    ```
5.  **Open a Pull Request:** Go to the original repository and open a pull request from your forked branch to the main project's `main` branch.
6.  **Describe Your Changes:** Provide a clear description of the changes you've made in the pull request.

If you're planning to add a new service, please ensure it's a publicly accessible AI tool or service and provide its correct name, URL, and ideally a favicon URL.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

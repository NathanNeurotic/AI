[![image](https://github.com/user-attachments/assets/2bddd6c3-b6a7-4a90-b3d1-0d2cc7e62606)](https://nathanneurotic.github.io/AI)

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
*   **Themed Interface:** Retro-terminal aesthetic with a typing effect in the header.
*   **Alphabetical Sorting:** Categories and services are automatically sorted alphabetically when `script.js` dynamically loads `services.json`.
*   **Favorites:** Mark services with the star icon to quickly access them in a dedicated "Favorites" category that persists using `localStorage`.
*   **Category View Toggle:** Each category can switch between grid and list layouts independently, and the choice is remembered.
*   **Mobile View Toggle:** Force a single-column layout regardless of screen size with the "Mobile View" button.

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

3.  **Open the site:**
    Simply open the `index.html` file in your web browser. No special server is needed as it's a static website.

### Running Tests

If you have Node.js installed (version 18 or newer), first install the dev dependencies:
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

## Using Favorites

Click the star icon next to any service to mark it as a favorite. Favorited services appear in the "Favorites" category directly below the search box. Your selections are stored locally in your browser's `localStorage`, so they remain available on future visits.

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
2.  Add or edit an object in the JSON array with the fields `name`, `url`, `favicon_url`, and `category`. Optionally include `tags` for improved search results and a `thumbnail_url` to display a preview image.
    ```json
    {
        "name": "Example Service",
        "url": "https://example.com/",
        "favicon_url": "https://example.com/favicon.ico",
        "category": "My Category",
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
*   A built-in theme switcher toggles the `light-mode` class on `<body>` using `script.js` and remembers your choice in `localStorage`. Customize the default colors by changing the CSS variables defined at the top of `styles.css`.

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

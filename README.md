# AI Services Dashboard (formerly Top AI Models and Tools 2025)

## Overview

The AI Services Dashboard is a static webpage designed to provide a curated list of AI services and tools, categorized for easy navigation. It features a clean, retro-terminal-inspired interface with search functionality and collapsible sections, ensuring a user-friendly experience on both desktop and mobile devices.

## Features

*   **Categorized Listings:** AI services are grouped into relevant categories (e.g., All-in-One AI Assistants, Image Generation, Video Generation).
*   **Quick Search:** Filter services by name or URL using the search bar.
*   **Collapsible Sections:** Easily expand and collapse categories to manage visibility.
*   **Direct Links:** Each service entry links directly to the respective service's website.
*   **Favicon Display:** Shows favicons for listed services for quick visual identification.
*   **Responsive Design:** Optimized for various screen sizes, including mobile devices.
    *   Header text wraps correctly on narrow screens.
    *   Interactive elements are properly handled in collapsed sections on mobile.
*   **Persistent Category State:** Remembers which categories were left open or closed across sessions using browser localStorage.
*   **Themed Interface:** Retro-terminal aesthetic with a typing effect in the header.

## Getting Started

Follow these instructions to get a local copy of the AI Services Dashboard up and running on your machine.

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
*   Git for cloning the repository (optional, you can also download the source code as a ZIP file).

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

If you have Node.js installed, you can run the unit tests with:

```bash
npm test
```

This uses Jest with `jsdom` to verify functionality in `script.js`.
The tests cover category toggling and the search filtering behavior.

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

To add a new service or modify an existing one:

1.  Open `index.html` in a text editor.
2.  Locate the category section (e.g., `<section class="category" id="conversational-ai">`) where you want to add or edit a service.
3.  Service entries are `<a>` tags with the class `service-button`. To add a new service, you can copy an existing one and modify its details:
    ```html
    <a href="NEW_SERVICE_URL" class="service-button" target="_blank">
        <img class="service-favicon" src="NEW_SERVICE_FAVICON_URL" onerror="this.src='./favicon.ico'" alt="Service favicon">
        <span class="service-name">New Service Name</span>
        <span class="service-url">NEW_SERVICE_URL</span>
    </a>
    ```
    Replace `NEW_SERVICE_URL`, `NEW_SERVICE_FAVICON_URL` (or use a generic path if a direct favicon URL isn't available or reliable), and `New Service Name` with the appropriate information.
4.  Ensure the HTML structure is maintained.

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

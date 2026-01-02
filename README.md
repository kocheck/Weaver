# LocalMock Data - Sketch Plugin

> Generate realistic mock data for your Sketch designs using local AI (Llama 3 via Ollama)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Sketch](https://img.shields.io/badge/sketch-70%2B-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

LocalMock Data is a Sketch plugin that leverages local LLM (Large Language Model) technology to generate contextual, realistic mock data for your designs. Instead of manually typing placeholder text or using random lorem ipsum, you can now generate creative, context-aware content that matches your design needs.

### Key Features

- 🤖 **Local AI Integration** - Uses Ollama (Llama 3) running locally, no API keys or cloud services required
- 🎨 **Smart Layer Mapping** - Automatically detects and populates layers named with variable syntax (e.g., `$cardTitle`, `$price`)
- 🔄 **Symbol Override Support** - Works with both text layers and symbol instance overrides
- 🎭 **Contextual Generation** - Provide natural language prompts to generate themed, realistic data
- ⚡ **Fast & Private** - Everything runs locally on your machine
- 🧪 **Fully Tested** - Comprehensive test suite ensures reliability

## 📋 Prerequisites

Before installing the plugin, you need to have Ollama installed and running:

### Install Ollama

1. **Download Ollama:**
   - Visit [https://ollama.com](https://ollama.com)
   - Download for your operating system (macOS, Linux, Windows)

2. **Install Llama 3:**
   ```bash
   ollama pull llama3
   ```

3. **Verify Ollama is Running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

   You should see a JSON response with available models.

## 🚀 Installation

### Option 1: From Release (Recommended)

1. Download the latest `localmock-data.sketchplugin` from the [Releases](https://github.com/username/localmock-sketch-plugin/releases) page
2. Double-click the file to install
3. Sketch will automatically install the plugin

### Option 2: From Source

```bash
# Clone the repository
git clone https://github.com/username/localmock-sketch-plugin.git
cd localmock-sketch-plugin

# Install dependencies
npm install

# Build and link the plugin
npm run build
npm run link
```

## 📖 Usage

### Basic Workflow

1. **Prepare Your Layers**

   Name layers using the `$` prefix to mark them as variables:
   - `$cardTitle` - Product title
   - `$description` - Description text
   - `$price` - Price information
   - `$authorName` - Author name

   The plugin supports:
   - Text layers
   - Symbol instance overrides

2. **Select Your Layers**

   Select one or more layers (or groups containing variable layers)

3. **Open the Plugin**

   - **Menu:** Plugins → LocalMock Data → Generate Mock Data
   - **Keyboard:** `Ctrl + Shift + M`

4. **Configure Generation**

   In the plugin UI:
   - **JSON Keys:** Enter the variable names (comma-separated)
     - Example: `cardTitle, description, price`
   - **Context Prompt:** Describe the type of data you need
     - Example: "Menu items for a cyberpunk noodle bar in Tokyo"

5. **Generate**

   Click "✨ Generate Data" and watch your layers populate with AI-generated content!

### Example Use Cases

#### E-commerce Product Cards

**Layers:**
```
$productName
$productDescription
$price
$rating
$reviewCount
```

**JSON Keys:** `productName, productDescription, price, rating, reviewCount`

**Prompt:** "High-end sustainable fashion products for eco-conscious millennials"

**Result:**
- productName: "Organic Hemp Blazer"
- productDescription: "Ethically sourced, carbon-neutral business wear"
- price: "$189.99"
- rating: "4.8"
- reviewCount: "127 reviews"

#### Restaurant Menu

**Layers:**
```
$dishName
$ingredients
$price
$calories
```

**JSON Keys:** `dishName, ingredients, price, calories`

**Prompt:** "Fusion sushi restaurant menu items with modern twist"

**Result:**
- dishName: "Spicy Tuna Volcano Roll"
- ingredients: "Fresh tuna, avocado, jalapeño, tempura flakes"
- price: "$16"
- calories: "380 cal"

#### User Profile Cards

**Layers:**
```
$userName
$bio
$location
$followers
```

**JSON Keys:** `userName, bio, location, followers`

**Prompt:** "Social media profiles for travel influencers"

**Result:**
- userName: "WanderlustSarah"
- bio: "Digital nomad exploring hidden gems 🌍"
- location: "Bali, Indonesia"
- followers: "24.5K"

## 🎨 Layer Naming Conventions

### Variable Syntax

Prefix layer names with `$` to mark them as variables:

✅ **Good:**
- `$cardTitle`
- `$price`
- `$userName`
- `$description`

❌ **Bad:**
- `cardTitle` (missing $)
- `$card-title` (use camelCase)
- `$` (empty variable name)

### Best Practices

1. **Use camelCase:** `$productName` instead of `$product_name`
2. **Be Descriptive:** `$authorBio` instead of `$text1`
3. **Match JSON Keys:** Layer `$price` → JSON key `price`
4. **Nested Groups:** Variable layers work at any nesting level

## ⚙️ Advanced Settings

Click "⚙️ Advanced Settings" in the plugin UI to configure:

### Ollama Endpoint

- **Default:** `http://localhost:11434/api/generate`
- **Custom:** If running Ollama on a different port or remote server

### Model Selection

- **Default:** `llama3`
- **Alternatives:** `llama3.1`, `mistral`, `codellama` (any Ollama model)

### Testing Connection

Click "Test Connection" to verify Ollama is accessible before generating data.

## 🧪 Development & Testing

### Run Tests

```bash
npm test
```

The test suite includes:
- **Unit Tests:** Layer traversal, LLM client, data injection
- **Integration Tests:** Complete workflow testing
- **Mocked Dependencies:** Tests run without requiring Sketch or Ollama

### Test Coverage

- `layerTraversal.test.js` - Layer detection and variable extraction
- `llmClient.test.js` - Ollama API communication
- `dataInjector.test.js` - Data injection logic
- `integration.test.js` - End-to-end workflows

### Watch Mode

```bash
npm run test:watch
```

### Build

```bash
npm run build
```

Output: `localmock-data.sketchplugin`

### Development Mode

```bash
npm run watch
```

Automatically rebuilds the plugin on file changes.

## 🏗️ Architecture

### Project Structure

```
localmock-sketch-plugin/
├── src/
│   ├── my-command.js              # Main plugin entry point
│   ├── ui.html                    # WebView UI
│   └── utils/
│       ├── layerTraversal.js      # Layer scanning & detection
│       ├── llmClient.js           # Ollama API client
│       └── dataInjector.js        # Data injection logic
├── __tests__/
│   ├── layerTraversal.test.js
│   ├── llmClient.test.js
│   ├── dataInjector.test.js
│   └── integration.test.js
├── manifest.json                  # Plugin manifest
├── package.json                   # NPM configuration
└── README.md
```

### Core Modules

#### `layerTraversal.js`

Handles recursive layer scanning to find variable-named layers:
- `findVariableLayers()` - Recursively finds all variable layers
- `extractVariableNames()` - Extracts unique variable names
- `validateLayers()` - Validates selection contains variables

#### `llmClient.js`

Manages communication with Ollama:
- `generateMockData()` - Sends prompts and receives JSON data
- `testConnection()` - Verifies Ollama is accessible
- `getAvailableModels()` - Lists available Ollama models

#### `dataInjector.js`

Injects generated data into layers:
- `injectData()` - Updates text layers and symbol overrides
- `previewInjection()` - Shows what will be updated
- `validateData()` - Ensures data matches required structure

## 🔧 Troubleshooting

### "Failed to connect to Ollama"

**Cause:** Ollama is not running or not accessible

**Solution:**
1. Start Ollama: `ollama serve`
2. Verify: `curl http://localhost:11434/api/tags`
3. Check firewall settings

### "No variable layers found"

**Cause:** No layers are named with `$` prefix

**Solution:**
- Rename layers to use variable syntax (e.g., `$cardTitle`)
- Ensure layers are selected before running the plugin

### "Failed to parse JSON from LLM response"

**Cause:** LLM generated invalid JSON

**Solution:**
1. Simplify your prompt
2. Reduce the number of JSON keys
3. Try a different model (e.g., `llama3.1`)

### "Request timeout"

**Cause:** LLM is taking too long to respond (>60s)

**Solution:**
1. Reduce complexity of the prompt
2. Use a smaller model
3. Ensure your system has sufficient resources

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Write tests** for new functionality
4. **Run tests:** `npm test`
5. **Commit changes:** `git commit -m 'Add amazing feature'`
6. **Push to branch:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Ollama** - For making local LLM inference accessible
- **Meta** - For Llama 3
- **Sketch** - For the excellent plugin API
- **skpm** - For the Sketch plugin development framework

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/username/localmock-sketch-plugin/issues)
- **Discussions:** [GitHub Discussions](https://github.com/username/localmock-sketch-plugin/discussions)

## 🗺️ Roadmap

- [ ] Support for image generation (layer fills)
- [ ] Multiple data variants (generate sets)
- [ ] Custom model fine-tuning
- [ ] Cloud LLM provider support (OpenAI, Anthropic)
- [ ] Data templates library
- [ ] Batch processing for multiple artboards

---

**Made with ❤️ for the Sketch community**

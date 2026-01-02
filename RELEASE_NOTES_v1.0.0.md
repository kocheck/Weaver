# Weaver v1.0.0 🧵

## The "Holy Shift, It Actually Works Offline" Release

*Finally, a mock data plugin that doesn't phone home like your Smart TV*

---

Hey there, fellow pixel pushers and layer hoarders! 👋

We're stoked (and slightly sleep-deprived) to ship the first official release of **Weaver** — a Sketch plugin that's basically what happens when you give a designer too much coffee and access to local LLMs.

### What Even Is This?

You know that moment when you're designing product cards at 2 AM and you're like "I need realistic e-commerce copy, but I'm too tired to type 'Lorem ipsum dolor sit amet' for the 47th time"? Yeah, we built something for that.

Weaver hooks into [Ollama](https://ollama.com) (running locally on your Mac, because we respect your data like we respect 8pt grid systems) and generates contextual, realistic content right into your Sketch layers. No API keys. No cloud services. No selling your artboard names to ad networks.

**It's like having a tiny, very focused copywriter living inside your computer. And unlike real copywriters, it never asks for creative feedback on its poetry.**

---

## ✨ Features That'll Make You Feel Like a Design Wizard

### 🏠 **Local-First Architecture**
Everything runs on *your* machine. Your designs stay yours. We believe in privacy the way we believe in pixel-perfect alignment — it's non-negotiable.

- ✅ Works on airplanes (Southwest WiFi can't hurt you here)
- ✅ Works in coffee shops with sketch WiFi
- ✅ Works when your ISP is having an existential crisis
- ✅ No API keys to manage, leak, or accidentally commit to GitHub

### 🧵 **Smart Layer Detection**
Name your layers with a `$` prefix (like `$productName`, `$price`, `$userBio`) and Weaver automatically finds them. It's like CSS selectors, but for your artboards.

**Pro tip:** We use camelCase because we're designers who can code, not monsters who use snake_case in layer names.

### 🎭 **Contextual AI Generation**
Tell Weaver what kind of data you need with natural language:
- "High-end sustainable fashion for eco-conscious millennials"
- "Cyberpunk noodle bar menu items in Tokyo"
- "Startup bro LinkedIn profiles (extra synergy)"

The AI understands context and generates data that actually makes sense. It won't give you "Quantum Blockchain Sushi" unless you specifically ask for cursed content.

### 🔄 **Symbol Override Support**
Works with both text layers AND symbol overrides. Because we know you've already built that design system, and we're not about to make you refactor it.

### ⚙️ **Advanced Settings (For the Nerds)**
- Custom Ollama endpoints (if you're running it on a server because you're fancy like that)
- Model selection (llama3, mistral, or whatever weird fine-tune you've got)
- Connection testing (because trust, but verify)

---

## 🎨 How It Works (The Magic, Demystified)

1. **Name your layers** using the `$variableName` syntax
   ```
   $cardTitle
   $description
   $price
   $rating
   ```

2. **Select your layers** (or the group containing them, we're not picky)

3. **Run the plugin** via `Plugins → Weaver → Generate Mock Data` or `Ctrl+Shift+M` (if you're a keyboard shortcut person, which, respect)

4. **Configure your generation:**
   - **JSON Keys:** `cardTitle, description, price, rating`
   - **Context Prompt:** "Artisanal coffee products for caffeine-dependent designers"

5. **Click "✨ Generate Data"** and watch your layers populate with AI-generated goodness

---

## 📦 Installation

### Download the Plugin

1. Grab `weaver.sketchplugin` from this release (it's right below this wall of text)
2. Double-click it
3. Sketch does the rest
4. You're now 10x more productive (results may vary)

### Install Ollama (Required)

Because Weaver needs a brain, and Ollama is basically the brain:

```bash
# Install Ollama from https://ollama.com
# Then pull the Llama 3 model
ollama pull llama3
```

**Check it's working:**
```bash
curl http://localhost:11434/api/tags
```

If you see JSON, you're golden. If you see an error, check their docs (we'd help, but we're just a humble Sketch plugin).

---

## 🧪 What We Tested (So You Don't Have To)

- ✅ E-commerce product cards
- ✅ Restaurant menu items
- ✅ User profile bios
- ✅ Testimonials (that don't sound like they were written by aliens)
- ✅ Pricing tables
- ✅ Feature descriptions
- ✅ Error messages (meta, we know)

**What we didn't test:** Using this to generate your standup notes. But let us know how that goes.

---

## 🐛 Known Issues (aka "Features We're Still Debugging")

None yet! 🎉

But when you find them (and you will, because Murphy's Law is a thing), please open an issue on GitHub. Include:
- Your Sketch version
- Your Ollama model
- Steps to reproduce
- A screenshot (designers love screenshots)

---

## 🙏 Thanks To

- **You** — for trying this thing we made
- **Ollama** — for making local LLMs accessible
- **Meta** — for Llama 3 (open source LLMs ftw)
- **Sketch** — for having a plugin API that doesn't make us cry
- **Coffee** — for existing

---

## 🗺️ What's Next?

We've got some ideas brewing:
- Image generation (imagine AI-generated placeholder images that don't suck)
- Batch processing (populate 20 artboards at once)
- Data templates (save your favorite prompts)
- More LLM provider support (for when you *do* have internet)

But honestly, we're just vibing and seeing what the community wants. Hit us up in Discussions if you've got ideas.

---

## 🧵 Why "Weaver"?

Because we weave data into your layers like threads in a fabric. Also, "Local-First AI Mock Data Generator for Sketch" doesn't exactly roll off the tongue.

**Made with ❤️ (and possibly too much caffeine) by designers who code**

---

### Quick Links
- 📖 [Full Documentation](https://github.com/kocheck/Weaver)
- 🐛 [Report Issues](https://github.com/kocheck/Weaver/issues)
- 💬 [Join Discussions](https://github.com/kocheck/Weaver/discussions)

---

**Version:** 1.0.0
**Release Date:** January 2026
**Requires:** Sketch 70+, Ollama with Llama 3
**License:** MIT (because sharing is caring)

*Now go forth and generate some beautiful, contextual, privacy-respecting mock data.* ✨

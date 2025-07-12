# THE PANTS PROJECT

## ABOUT

The Pants Project is an interactive visualization that explores the latent space of pants using machine learning. It creates a visual map where each point represents a pair of pants, and similar pants are positioned close together in this digital space.

## WHAT IT DOES

**PANTS DENSITY MAP**: The left panel shows a 100x100 grid where brighter orange dots indicate areas with higher concentrations of similar pants. This map reveals natural clusters and patterns in how different types of pants relate to each other.

**INTERACTIVE EXPLORATION**: Click anywhere on the density map to find the 9 most similar pants to that location. The right panel displays these similar pants, allowing you to discover new styles and understand how different pants relate to each other.

**VISUAL ZONES**: The map is divided into labeled zones that represent different categories of pants:
- **LIGHT ZONE**: Casual, light-colored pants
- **DARK ZONE**: Formal, dark-colored pants  
- **PATTERN ZONE**: Pants with patterns and prints
- **DENIM ZONE**: Jeans and denim styles
- **DARK DENIM ZONE**: Premium dark denim

## HOW IT WORKS

The project uses a VGG-18 neural network to analyze thousands of pants images and create a mathematical representation of their visual features. Similar pants end up close together in this "latent space," creating natural clusters that we can visualize and explore.

## PURPOSE

This project demonstrates how machine learning can help us understand and explore large collections of fashion items. It shows how AI can identify patterns and relationships that might not be obvious to the human eye, making it easier to discover new styles and understand fashion trends.

---

*The Pants Project - Exploring Fashion Through AI*
*Dylan Hubert and Luke Heitman*
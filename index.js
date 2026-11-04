module.exports = {
  setupEleventy(eleventyConfig) {
    eleventyConfig.addFilter("gpRelatedNotes", function (graph, url, count) {
      const nodes = (graph && graph.nodes) || {};
      const current = nodes[url];
      if (!current) {
        return [];
      }

      // 1. Get strictly direct neighbors (1st-degree local graph)
      const directUrls = current.neighbors || [];

      // Map URLs to their full node objects from the graph
      const strictlyRelated = directUrls
        .map(neighborUrl => {
          const node = nodes[neighborUrl];
          return node ? { url: neighborUrl, ...node } : null;
        })
        .filter(Boolean);

      // 2. Classifier function to identify "Collection" logs
      const isCollectionNode = (node) => {
        const titleText = (node.title || '').toLowerCase();
        const pathString = (node.url || '').toLowerCase();
        const tags = node.tags || [];
        
        return titleText.includes('collection') || 
               pathString.includes('collections/') ||
               tags.includes('collection');
      };

      // Separate regular logs from collections
      const regularLogs = strictlyRelated.filter(node => !isCollectionNode(node));
      const collectionLogs = strictlyRelated.filter(node => isCollectionNode(node));

      // 3. Rule: Include collections only if there are 3 or fewer regular logs
      let finalSelection = [];
      if (regularLogs.length <= 3) {
        finalSelection = [...regularLogs, ...collectionLogs];
      } else {
        finalSelection = regularLogs;
      }

      // Return the formatted array sliced to your preferred count limit
      return finalSelection
        .slice(0, count || 4)
        .map(node => ({
          url: node.url,
          title: node.title,
          noteIcon: node.noteIcon,
        }));
    });
  },
};
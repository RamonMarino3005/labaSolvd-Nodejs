function highlightKeywords(string, values) {
    let template = (val) => `<span class='highlight'>${val}</span>`;
    return string.replace(/\$\{(\d+)\}/g, (_, idx) => template(values[Number(idx)]));
}
const keywords = ["JavaScript", "template", "tagged"];
const template = `Learn \${0} tagged templates to create custom \${1} literals for \${2} manipulation.`;
console.log("Formatted Template: ", highlightKeywords(template, keywords));

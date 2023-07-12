const tabs = await chrome.tabs.query({
    url: [
        "https://*/*",
        "http://*/*",
    ],
});
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.trim();
    const pathname = new URL(tab.url);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector(".gotoButton").addEventListener("click", async () => {
        // need to focus window as well as the active tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
}
document.querySelector("ul").append(...elements);
const button = document.querySelector(".groupTabsButton");

button.addEventListener("click", async () => {
    let groupColor = document.querySelector('input[name="color"]:checked').value;
    let color;

    switch (groupColor) {
        case "grey":
            color = "grey";
            break;
        case "blue":
            color = "blue";
            break;
        case "red":
            color = "red";
            break;
        case "yellow":
            color = "yellow";
            break;
        case "green":
            color = "green";
            break;
        case "pink":
            color = "pink";
            break;
        case "purple":
            color = "purple";
            break;
        case "cyan":
            color = "cyan";
            break;
        case "orange":
            color = "orange";
            break;
        default:
            color = "grey";
    }

    var tabIds;
    var group;
    const tabTitle = document.getElementById("tabsTitle").value;
    const checkboxes = document.getElementsByName("checkbox");
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            tabIds = tabs.map(({ id }) => id)[i];
            group += await chrome.tabs.group({ tabIds });
        }
    }
    await chrome.tabGroups.update(group, { title: tabTitle, color: color });
});

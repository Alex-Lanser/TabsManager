const tabs = await chrome.tabs.query({
    url: [
        "https://*/*",
        "http://*/*",
    ],
});

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
var lis = document.getElementsByClassName("listItems");
var idinc = 0;
for (var i = 0; i < lis.length; i++) {
    idinc++;
    lis[i].id = "lisItem" + idinc;
}

for (var i = 0; i < idinc; i++) {
    // if groupId == -1, then tab is not in a group
    const getTab = await chrome.tabs.get(tabs.map(({ id }) => id)[i]);
    const groupId = getTab.groupId;

    if (groupId != -1) { // If tab is in group
        const getGroup = await chrome.tabGroups.get(groupId);
        const groupColor = getGroup.color;
        const backgroundColor = chooseColor(groupColor);
        document.getElementById(lis[i].id).style.borderLeft = "10px solid " + backgroundColor;

    }
    else { // Tab is not in group

    }
}

button.addEventListener("click", async () => {
    let groupColor = document.querySelector('input[name="color"]:checked').value;
    let backgroundColor;
    backgroundColor = chooseColor(groupColor);

    var tabIds = [];
    const tabTitle = document.getElementById("tabsTitle").value;
    const checkboxes = document.getElementsByName("checkbox");
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            tabIds.push(tabs.map(({ id }) => id)[i]);
            // console.log("Tab.get(): ", chrome.tabs.get(tabs.map(({ id }) => id)[i]));
            checkboxes[i].checked = false;
            document.getElementById(lis[i].id).style.borderLeft = "10px solid " + backgroundColor;
        }
    }

    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: tabTitle, color: groupColor });
    // console.log(chrome.tabGroups.get(group));
    document.getElementById("tabsTitle").value = "";
});

function chooseColor(groupColor) {
    var backgroundColor;
    switch (groupColor) {
        case "grey":
            backgroundColor = "#E6E6E6";
            break;
        case "blue":
            backgroundColor = "#76A7FA";
            break;
        case "red":
            backgroundColor = "#ED9D97";
            break;
        case "yellow":
            backgroundColor = "#FFE168";
            break;
        case "green":
            backgroundColor = "#7BCFA9";
            break;
        case "pink":
            backgroundColor = "#F08AC9";
            break;
        case "purple":
            backgroundColor = "#C189F8";
            break;
        case "cyan":
            backgroundColor = "#82D8E8";
            break;
        case "orange":
            backgroundColor = "#F0A96A";
            break;
        default:
            backgroundColor = "#E6E6E6";
    }
    return backgroundColor;
}
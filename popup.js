var refresh = false;
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
    element.querySelector(".removeButton").addEventListener("click", async () => {
        await chrome.tabs.remove(tab.id);
        refreshWindow();
    });
    elements.add(element);
}

document.querySelector("ul").append(...elements);
var lis = document.getElementsByClassName("listItems");
var idinc = 0;
for (var i = 0; i < lis.length; i++) {
    idinc++;
    lis[i].id = "lisItem" + idinc;
}

var groupIds = [];
var groupTitles = [];
var groupColors = [];
for (var i = 0; i < idinc; i++) {
    // if groupId == -1, then tab is not in a group
    const getTab = await chrome.tabs.get(tabs.map(({ id }) => id)[i]);
    const groupId = getTab.groupId;

    if (groupId != -1) { // If tab is in group
        const getGroup = await chrome.tabGroups.get(groupId);
        const groupColor = getGroup.color;
        const backgroundColor = chooseColor(groupColor);
        document.getElementById(lis[i].id).style.borderLeft = "10px solid " + backgroundColor;
        groupIds.push(groupId);
        groupTitles.push(getGroup.title);
        groupColors.push(getGroup.color);
    }
}
groupIds = removeDuplicates(groupIds);
groupTitles = removeDuplicates(groupTitles);
groupColors = removeDuplicates(groupColors);
const removeTabsButton = document.querySelector(".removeTabsButton");
removeTabsButton.addEventListener("click", async () => {
    try {
        var tabIds = [];
        const checkboxes = document.getElementsByName("checkbox");
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                tabIds.push(tabs.map(({ id }) => id)[i]);
                checkboxes[i].checked = false;
                document.getElementById(lis[i].id).style.borderLeft = "none";
            }
        }
        await chrome.tabs.ungroup(tabIds);
        refreshWindow();
    } catch (TypeError) {
        alert("Tab(s) must be selected to remove!");
    }
});

const button = document.querySelector(".groupTabsButton");
button.addEventListener("click", async () => {
    var groupColor;
    try {
        groupColor = document.querySelector('input[name="color"]:checked').value;
        let backgroundColor;
        backgroundColor = chooseColor(groupColor);

        var tabIds = [];
        let tabTitle = document.getElementById("tabsTitle").value;
        const checkboxes = document.getElementsByName("checkbox");
        if (groupColors.indexOf(groupColor) != -1 && groupTitles.indexOf(tabTitle) != -1) {
            // Background color is in groupColors and title is in groupTitles
            const groupIndex = groupColors.indexOf(groupColor); // groupIds index will be the same as groupTitles and groupColors
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    // If backgroundColor == a groupColor && tabTitle == a groupTitle, add selected tabs to group
                    tabIds.push(tabs.map(({ id }) => id)[i]);
                    checkboxes[i].checked = false;
                    document.getElementById(lis[i].id).style.borderLeft = "10px solid " + backgroundColor;
                }
            }
            const group = await chrome.tabs.group({ tabIds: tabIds, groupId: groupIds[groupIndex] });
            await chrome.tabGroups.update(group, { title: tabTitle, color: groupColor });
        }
        else {
            // There is not group with same name and color
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    // Parse through all group colors and titles
                    tabIds.push(tabs.map(({ id }) => id)[i]);
                    checkboxes[i].checked = false;
                    document.getElementById(lis[i].id).style.borderLeft = "10px solid " + backgroundColor;
                }
            }
            const group = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(group, { title: tabTitle, color: groupColor });
        }
        document.getElementById("tabsTitle").value = "";
        refreshWindow();
    } catch (TypeError) {
        if (groupColor == null) {
            alert("Group must have a color");
        }
        else {
            alert("Tab(s) must be selected to add to a group!");
        }
    }
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

function removeDuplicates(arr) {
    let unique = [];
    for (i = 0; i < arr.length; i++) {
        if (unique.indexOf(arr[i]) === -1) {
            unique.push(arr[i]);
        }
    }
    return unique;
}

function refreshWindow() {
    if (!refresh) {
        window.location.href = "popup2.html";
        refresh = true;
    }
    else if (refresh) {
        window.location.href = "popup.html";
        refresh = false;
    }
}
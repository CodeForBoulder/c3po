    function showDocs(curCaseNum) {
        "use strict";

            //  Build document links array and invoke the docsModal.
            // 
            //  GET https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=LUR2013-00070
            // This returns an array of titles
            // Convert the string so no spaces, etc.
            // Then display the links by appending the titles to:
            //   "https://www-static.bouldercolorado.gov/docs/PDS/plans/"+caseNum+"/"
            //
        var TitleLinkCol = [],
            xmlhttp,
            docURL = "https://www-webapps.bouldercolorado.gov/pds/publicnotice/docspics.php?caseNumber=";

        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for older browsers
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                var docTitles = xmlhttp.responseText,
                // response text is a JSON string that needs to be parsed...
                    docTitlesObj = EJSON.parse(docTitles),
                    titleUrlBase = "https://www-static.bouldercolorado.gov/docs/PDS/plans/" + curCaseNum + "/";
                if (Array.isArray(docTitlesObj)) {
                    // Must handle the case where 1 document is available and no thumbs.db exists.
                    //      Because of cross-domain restrictions, we cannoc check for existence of the file, 
                    //      so the best we may be able to do is filter by extension (e.g. 'pdf').
                    for (var title in docTitlesObj) {
                        var link = {};
                        link.title = docTitlesObj[title];
                        link.url = titleUrlBase + encodeURI(docTitlesObj[title]);
                        if (link.title.endsWith('.pdf')) {
                            TitleLinkCol.push(link);
                        }
                    }
                    //  Only one modal can display at a time. Must ensure one hides before showing the other.
                    $('#caseModal').on('hidden.bs.modal', function () { // set the listener before hiding
                        Modal.show('docsModalTemplate',
                            {
                                caseNum: curCaseNum,
                                docLinks: TitleLinkCol
                            });
                        $('#docsModal').on('hidden.bs.modal', function () {
                            //  when user dismisses docsModal, show the case details again
                            showDetails();
                        });
                    });
                    $('#caseModal').modal('hide');
                    console.log('showing case ' + curCaseNum + ' document ' + TitleLinkCol[0].title);
                } else {
                    // in this case, we received a single error message, not an array of doc links
                    //  NOTE: this may depend on an Thumbs.db being included in the list of documents
                    if (docTitlesObj.endsWith('.pdf')) {
                        TitleLinkCol.push(docTitlesObj);
                    } else {
                        alert(docTitlesObj);
                    }
                }
            } else {
                if ((xmlhttp.readyState >= 0 && xmlhttp.readyState < 4) || xmlhttp.status === 404) {
                    console.log("processing doc list request");
                } else if (xmlhttp.status !== 200) {
                    console.log("failed to retrieve documents for caseNumber " + curCaseNum +
                                "\nwith readyState = " + xmlhttp.readyState +
                                "\nand response: " + EJSON.parse(xmlhttp.responseText));
                }
                return (null);
            }
        };
        xmlhttp.open("GET", docURL + curCaseNum, true);
        xmlhttp.send();
    }

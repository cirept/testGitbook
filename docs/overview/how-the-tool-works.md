# How the Tool Works

Now that you have an idea of what the tool looks like, allow me to explain how it works.  I'll be brief so that I don't bore you.

When you click the magic button the tool performs theses steps on **each** autofill entry in the list.

1. Saves the entire autofill list into memory. \(The list is read from top to bottom\)
2. Reads the text in the input area of the first autofill entry.
3. Begins to scan the web page \(from top to bottom\) for any matching text.
   1. If matches are found, the matching text is replaced with the autofill tag in that entry.
   2. If matches are no found, nothing is done.
4. Once it reaches the end of the document, the tool moves onto the next autofill entry in the list, if there is one.
5. Steps 2 - 5 are performed for each autofill entry in the list until it reaches the end of the list.
6. Once all autofill entries in the list have been looped through, the magic is complete.

That wasn't too bad was it?  All this happens quick so it appears that all the replacing happens at once.

![](../.gitbook/assets/image.png)

Now to go into depth on each of the tools buttons!


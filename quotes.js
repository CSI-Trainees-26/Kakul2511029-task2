let savedQuotes=[];
function loadQuotes(){
    const saved=localStorage.getItem("fitness_saved_quotes");
    savedQuotes=saved?JSON.parse(saved):[];
}
function saveQuotes(){
    localStorage.setItem("fitness_saved_quotes",JSON.stringify(savedQuotes));
}
function addQuote(text,author){
    const quote={
        id:Date.now(),
        text:text,
        author:author
};
    savedQuotes.push(quote);
    saveQuotes();
}
function deleteQuote(id){
    savedQuotes=savedQuotes.filter(function(quote){
    return quote.id!==id;
});
    saveQuotes();
}
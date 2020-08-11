$("#urlpath").on({
  keyup: function() {
    formatCurrency($(this));
  }
});

function formatCurrency(input) {
  var input_val = input.val();
  if (input_val === "") { return; }
  var original_len = input_val.length;
  var caret_pos = input.prop("selectionStart");
  console.log($("#urlpath").val())
  const url = `${location.hostname}/`
  setTimeout(() => {
    if (!$("#urlpath").val().includes(url)) {
      input.val(url + input_val);
    }
  }, 0)
  
  var updated_len = input_val.length;
  caret_pos = updated_len - original_len + caret_pos;
  input[0].setSelectionRange(caret_pos, caret_pos);
}
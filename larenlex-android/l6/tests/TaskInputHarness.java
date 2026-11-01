import nl.larenlex.app.TaskInputPolicy;
public final class TaskInputHarness {
    static int checks=0;
    static void check(boolean b){if(!b)throw new AssertionError("Test "+(checks+1));checks++;}
    static void rejects(String s){try{TaskInputPolicy.title(s);throw new AssertionError("Accepted invalid");}
        catch(IllegalArgumentException x){checks++;}}
    public static void main(String[] args){
        rejects("");
        rejects("  ");
        rejects("x".repeat(121));
        rejects("Bad\u0000name");
        rejects("Broken\uD800");
        check(TaskInputPolicy.title("Görev") .equals("Görev"));
        check(TaskInputPolicy.detail("").equals(""));
        check(TaskInputPolicy.detail("İki\nsatır").contains("\n"));
        try {TaskInputPolicy.detail("x".repeat(1201));throw new AssertionError("Long");}
        catch(IllegalArgumentException ex){checks++;}
        check(TaskInputPolicy.title("Göç / IND") .contains("IND"));
        System.out.println(checks+" PASS local task input");
    }
}
